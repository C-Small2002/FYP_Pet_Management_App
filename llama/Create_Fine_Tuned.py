from transformers import  LlamaTokenizer, Trainer, TrainingArguments, LlamaForCausalLM, BitsAndBytesConfig
import torch

model_name = "meta-llama/Llama-2-7b-chat-hf"
quantization_config = BitsAndBytesConfig(load_in_4bit=True)
tokenizer = LlamaTokenizer.from_pretrained(
    model_name,
    #quantization_config=quantization_config,
    #device_map="auto",
    torch_dtype=torch.float16
)
model = LlamaForCausalLM.from_pretrained(model_name, device_map="auto")

def tokenize_data(dataset):
    inputs = tokenizer(dataset['prompt'], max_length=512, truncation=True)
    outputs = tokenizer(dataset['response'], max_length=128, truncation=True)
    inputs['labels'] = outputs['input_ids']
    return inputs

from datasets import Dataset
dataset = Dataset.from_json("prompt_response.json")
tokenized_dataset = dataset.map(tokenize_data, batched=True)

training_arguments = TrainingArguments(
    output_dir="./llama_finetuned",
    eval_strategy="no",
    per_device_train_batch_size=1,
    #per_device_eval_batch_size=4,
    gradient_accumulation_steps=16,
    num_train_epochs=3,
    learning_rate=2e-5,
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

model.save_pretrained("./llama_finetuned")
tokenizer.save_pretrained("./llama_finetuned")