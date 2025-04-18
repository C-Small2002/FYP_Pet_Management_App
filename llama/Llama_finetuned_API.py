from fastapi import FastAPI
from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline, BitsAndBytesConfig
import torch
import uvicorn

from peft import PeftModel

#Initializing FastAPI
app = FastAPI()

#taking the base model
model_name = "meta-llama/Llama-2-7b-chat-hf"
tokenizer = AutoTokenizer.from_pretrained(model_name)

#config for loading in 4-bit percision
bnb_config = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type='nf4', #Using nf4 quantization which is optimized for LLMS
    bnb_4bit_use_double_quant=True, #Using Double quantization for better accuracy
    bnb_4bit_compute_dtype=torch.bfloat16 #Using bfloat16 for computation as saves on memory
)

#Loading the base model with the quantization config applied
base_model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float16,
    device_map="auto",
    quantization_config=bnb_config,
    offload_folder="./offload"
)

#Getting the LoRA adapter weights
lora_model = "/home/ubuntu/FYP_Pet_Management_App/llama_finetuned_lora"

#Loading them into the base model
model = PeftModel.from_pretrained(base_model, lora_model)

#Merging the LoRA weights into the model - Instead of them being on top of the model they are now part of the model
#Adapters are then unloaded as they are no longer needed
model = model.merge_and_unload()

#Creating the generation pipeline
text_generation = pipeline(
    "text-generation", #Specifying task
    model=model, 
    tokenizer=tokenizer,
    torch_dtype=torch.float16,
    device_map="auto"
)

#Defining the API endpoint
@app.post("/chat")
async def chat(message: dict):
    #Extracting the message
    input_text = message.get("message", "")

    sequences = text_generation(
        input_text,
        do_sample=True, #Makes it so model wont take the most likely next token and can take from a list of possible next tokens - allows for more creativity
        top_k=10, #Limits the sampling to the top 10 tokens
        top_p=0.9, #Samples only from 90% probability of being best next token
        num_return_sequences=1, #Return a single response
        eos_token_id=tokenizer.eos_token_id, #End of sequnce token
    )
    #Get the generated text from th eoutput
    response = sequences[0]["generated_text"] if sequences else "No Response Generated"
    #Retunr the response as JSON
    return {"response" : response}
#Start the server - runs on port 5000 using public IP of server its hosted on
if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=5000)