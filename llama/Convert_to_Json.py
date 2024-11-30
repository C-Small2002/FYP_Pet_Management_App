import pandas as pd
import json


def Gen_Prompt_Response_Pairs(input_file, output_file):
    df = pd.read_csv(input_file)
    def create_pairs(row):
        symptoms = ", ".join(filter(None, [row['Symptom_1'], row['Symptom_2'], row['Symptom_3'], row['Symptom_4']]))
        prompt = (
            f"Animal Type: {row['Animal_Type']}\n"
            f"Breed: {row['Breed']}\n"
            f"Age: {row['Age']}\n"
            f"Gender: {row['Gender']}\n"
            f"Weight: {row['Weight']}\n" 
            f"Symptoms: {symptoms}\n"
            f"Duration: {row['Duration']}\n"
            f"Body Temperature: {row['Body_Temperature']}\n"
            f"Heart Rate: {row['Heart_Rate']}bpm\n"
            f"What is the most likely disease prediction?"
        )
        response = row['Disease_Prediction']
        return {"prompt" : prompt, "response" : response}

    try:
        prompt_response_pairs = df.apply(create_pairs, axis =1).tolist()
    except Exception as e:
        print(f"Error Generating Pairs: {e}")

    try:
        with open(output_file, "w") as outfile:
            json.dump(prompt_response_pairs, outfile, indent=4)
    except Exception as e:
        print(f"Issue outputting to json file: {e}")

input_file = "cleaned_animal_disease_prediction.csv"
output_file = "prompt_response.json"

Gen_Prompt_Response_Pairs(input_file, output_file)