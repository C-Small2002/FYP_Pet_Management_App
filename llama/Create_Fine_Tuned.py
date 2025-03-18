from transformers import  LlamaTokenizer, Trainer, TrainingArguments, LlamaForCausalLM, BitsAndBytesConfig
from datasets import Dataset
from peft import LoraConfig, get_peft_model
import torch

model_name = "meta-llama/Llama-2-7b-chat-hf"
quantization_config = BitsAndBytesConfig(load_in_4bit=True)
tokenizer = LlamaTokenizer.from_pretrained(
    model_name,
    torch_dtype=torch.float16
)

tokenizer.pad_token = tokenizer.eos_token

lora_config = LoraConfig (
    r=8,
    lora_alpha=32,
    target_modules=["q_proj", "v_proj"], #Layers Lora is being applied to
    lora_dropout=0.1,
    bias="none",
    task_type="CAUSAL_LM" #Works specifically with llama and gpt esque models
)

model = LlamaForCausalLM.from_pretrained(model_name, device_map="auto", quantization_config= quantization_config)

model = get_peft_model(model, lora_config)
model.print_trainable_parameters()

def tokenize_data(dataset):
    inputs = tokenizer(
        dataset['prompt'],
        max_length=512, 
        truncation=True,
        padding='max_length' #Ensures all inputs are the same length
    )

    outputs = tokenizer(
        dataset['response'], 
        max_length=512, 
        truncation=True,
        padding='max_length' #Ensures all labels match input length
    )
    inputs['labels'] = outputs['input_ids']

    inputs['labels'] = [
        [(label if label != tokenizer.pad_token_id else -100) for label in labels]
        for labels in inputs['labels']
    ]

    return inputs


dataset = Dataset.from_json("C:/Users/catha/OneDrive/Desktop/Zoomies_FYP/llama/prompt_response.json")
tokenized_dataset = dataset.map(tokenize_data, batched=True)

training_arguments = TrainingArguments(
    output_dir="./llama_finetuned_lora",
    eval_strategy="no",
    per_device_train_batch_size=1,
    #per_device_eval_batch_size=4,  
    gradient_accumulation_steps=16,
    num_train_epochs=3,
    learning_rate=2e-4,
    logging_dir="./logs",
    logging_steps=50,
    save_steps=500,
    fp16=True,
    report_to=None
)

trainer = Trainer(
    model=model,
    args=training_arguments,
    train_dataset=tokenized_dataset
)


trainer.train()

model.save_pretrained("./llama_finetuned_lora")
tokenizer.save_pretrained("./llama_finetuned_lora")