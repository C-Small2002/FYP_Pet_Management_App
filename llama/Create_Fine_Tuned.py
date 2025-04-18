from transformers import  LlamaTokenizer, Trainer, TrainingArguments, LlamaForCausalLM, BitsAndBytesConfig
from datasets import Dataset
from peft import LoraConfig, get_peft_model
import torch


model_name = "meta-llama/Llama-2-7b-chat-hf"

#Loading tmodel in 4 bit percision to solve hardware issues
quantization_config = BitsAndBytesConfig(load_in_4bit=True)

#Loading tokenizer with 16 bit percision
tokenizer = LlamaTokenizer.from_pretrained(
    model_name,
    torch_dtype=torch.float16
)

#Ensuring the pad token is set to eos, which llama models use
tokenizer.pad_token = tokenizer.eos_token

#Defining the config for training
lora_config = LoraConfig (
    r=8, #Rank of the matrices
    lora_alpha=32, #Scaling factor for the LoRA layers
    target_modules=["q_proj", "v_proj"], #Layers Lora is being applied to
    lora_dropout=0.1, #Excluding 10% to prevent overfitting
    bias="none",
    task_type="CAUSAL_LM" #Works specifically with llama and gpt esque models
)

#Loading the model, auto maps between using gpu and cpu when it needs
model = LlamaForCausalLM.from_pretrained(model_name, device_map="auto", quantization_config= quantization_config)

#Injecting the LoRA layers
model = get_peft_model(model, lora_config)
model.print_trainable_parameters()

#Tokenizing the prompts from prompt_response
def tokenize_data(dataset):
    inputs = tokenizer(
        dataset['prompt'],
        max_length=512, 
        truncation=True,
        padding='max_length' #Ensures all inputs are the same length
    )

    #Doing the same as above for responses
    outputs = tokenizer(
        dataset['response'], 
        max_length=512, 
        truncation=True,
        padding='max_length' #Ensures all labels match input length
    )
    #Needed to tell model to predict output based on the inputs
    inputs['labels'] = outputs['input_ids']

    #Replaces padding tokens with -100 as during training these will be ignored.
    #Needed as otherwise model will be punished for not being able to predict padding
    inputs['labels'] = [
        [(label if label != tokenizer.pad_token_id else -100) for label in labels]
        for labels in inputs['labels']
    ]

    return inputs
#Loading the prompt response dataset
dataset = Dataset.from_json("C:/Users/catha/OneDrive/Desktop/Zoomies_FYP/llama/prompt_response.json")
tokenized_dataset = dataset.map(tokenize_data, batched=True)#Tokenizing it using the function created above

#Defining the training arguments
training_arguments = TrainingArguments(
    output_dir="./llama_finetuned_lora", #Specifying where the trained adapters will be stored
    eval_strategy="no", #Wont evaluate during training
    per_device_train_batch_size=1, #Batch size per GPU - 1 as theres 1 GPU
    #per_device_eval_batch_size=4,  
    gradient_accumulation_steps=16,
    num_train_epochs=3, #Number of epochs
    learning_rate=2e-4, 
    logging_dir="./logs",
    logging_steps=50,
    save_steps=500,
    fp16=True, #Training with mixed precisioon
    report_to=None
)

#Initilaizing the Trainer with the model and tokenized dataset
trainer = Trainer(
    model=model,
    args=training_arguments,
    train_dataset=tokenized_dataset
)

#Begin Training
trainer.train()

#Saving the LoRA adapters to a direcotry
model.save_pretrained("./llama_finetuned_lora")
tokenizer.save_pretrained("./llama_finetuned_lora")