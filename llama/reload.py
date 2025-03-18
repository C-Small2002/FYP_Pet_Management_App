from transformers import AutoTokenizer

model_path = "./llama_finetuned_lora"
tokenizer = AutoTokenizer.from_pretrained("meta-llama/Llama-2-7b-chat-hf")

#Manually save tokenizer
tokenizer.save_pretrained(model_path)
print("Tokenizer re-saved successfully!")

#This was needed as tokenizer was corrupted after training finished. As training takes at least 10 hours, 
# decided to save tokenizer from pretrained model.