from fastapi import FastAPI
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline
import torch
import uvicorn

app = FastAPI()

model_path = "./llama_finetuned_lora"
tokenizer = AutoTokenizer.from_pretrained(model_path)
model = AutoModelForCausalLM.from_pretrained(
    model_path,
    torch_dtype=torch.float16,
    device_map="auto"
)

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