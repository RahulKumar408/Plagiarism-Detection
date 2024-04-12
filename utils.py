
from transformers import pipeline
pipe = pipeline("text-classification", model="roberta-base-openai-detector")

def Check_AI_Text(pdf_text):
  pdf_text = pdf_text[:512]
  # return 20
  return pipe(pdf_text)[0]
