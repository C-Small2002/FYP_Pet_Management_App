from transformers import AutoTokenizer, AutoModelForCausalLM, pipeline, BitsAndBytesConfig
import transformers
from torch import cuda, bfloat16
import torch

import bitsandbytes

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

model.config.use_cache = False
model.config.pretraining_tp = 1

pipelines = pipeline(
    "text-generation",
    model=model,
    tokenizer=tokenizer,
    torch_dtype=torch.float16,
    device_map="auto",
)

sequences = pipelines(
    'My Pet, a Boxer, has been sick recently. She is currently 9 and has recently started limping. What could be the cause. Please give some suggestions of how i can look after my pet\n',
    do_sample=True,
    top_k=10,
    num_return_sequences=1,
    eos_token_id=tokenizer.eos_token_id,
    #truncation = True,
    #max_length=100
)

for seq in sequences:
    print(f"Result: {seq['generated_text']}")
