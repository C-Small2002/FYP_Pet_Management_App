from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline, BitsAndBytesConfig
import transformers
from torch import cuda, bfloat16
import torch
from flask import Flask, jsonify, request

app = Flask(__name__)

#config for loading in 4-bit percision
bnb_config = transformers.BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type='nf4',
    bnb_4bit_use_double_quant=True,
    bnb_4bit_compute_dtype=bfloat16
)


model_name = "meta-llama/Llama-2-7b-chat-hf"
tokenizer = AutoTokenizer.from_pretrained(model_name)

model = AutoModelForCausalLM.from_pretrained(
    model_name,
    torch_dtype=torch.float16,
    quantization_config = bnb_config,
    device_map="auto"
)

#disabling cache avoids excessive memory use
model.config.use_cache = False
model.config.pretraining_tp = 1

text_generation = pipeline(
    "text-generation",
    model=model,
    tokenizer=tokenizer,
    torch_dtype=torch.float16,
    device_map="auto",
)

@app.route("/chat", methods=["POST"])
def chat():
    data = request.json
    input = data.get("message", "")

    sequences = text_generation(
        input,
        do_sample=True,
        top_k=10,
        top_p=0.9,
        num_return_sequences=1,
        eos_token_id=tokenizer.eos_token_id,
        #truncation = True,
        #max_length=100
    )

    response = sequences[0]["generated_text"] if sequences else "No response generated"

    return jsonify({"response": response})

if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5000)

