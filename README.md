# Chat with  PDF

### AiChatPdf is an AI-powered web application that will make reading journal articles easier and faster.

## To run locally

```git clone https://github.com/hubsMIT1/pdf-chat.git```
#### frontend
```
cd chatwithpdf
npm i
#create .env 'VITE_API_URL='
npm run dev
```
#### backend

```
cd server
python -m venv venv
pip install -r requirements.txt
# create .env `GOOGLE_API_KEY=`
unicorn main:app --reload
```




