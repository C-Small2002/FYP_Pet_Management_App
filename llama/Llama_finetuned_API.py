from fastapi import FastAPI
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline, BitsAndBytesConfig
import torch
import uvicorn

from peft import PeftModel

app = FastAPI()

model_name = "meta-llama/Llama-2-7b-chat-hf"
tokenizer = AutoTokenizer.from_pretrained(model_name)

#config for loading in 4-bit percision
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type='nf4',
    bnb_4bit_use_double_quant=True,
    bnb_4bit_compute_dtype=torch.bfloat16
)

base_model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float16,
    device_map="auto",
    quantization_config=bnb_config,
    offload_folder="./offload"
)

lora_model = "/home/ubuntu/FYP_Pet_Management_App/llama_finetuned_lora"
model = PeftModel.from_pretrained(base_model, lora_model)
model = model.merge_and_unload()

text_generation = pipeline(
    "text-generation",
    model=model,
    tokenizer=tokenizer,
    torch_dtype=torch.float16,
    device_map="auto"
)

@app.post("/chat")
async def chat(message: dict):
    input_text = message.get("message", "")

    sequences = text_generation(
        input_text,
        do_sample=True,
        top_k=10,
        top_p=0.9,
        num_return_sequences=1,
        eos_token_id=tokenizer.eos_token_id,
    )

    response = sequences[0]["generated_text"] if sequences else "No Response Generated"
    return {"response" : response}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)