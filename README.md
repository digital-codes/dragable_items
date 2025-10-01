# RAG Demonstrator

Enable testing of fundamental RAG functions

   1. System Prompt 
      Choose from some presets via *Prompt Auswahl*. Add new lines (*pen* field) or edit any field. Rearrange via drag marker (left), remove via cancel marker (right).

   2. Input Query 

   3. Context 
      Derive context relevant for query to guide model response 
      There are several options in principle: 
         *  Full-text query for keywords 
         *  Vector search (with embeddings) 
         *  LLM classification 

      We use LLM classification. Click **Suche** next to *Frage*. Model returns set of categories.
      Matching context is assembled into context field. 
      Optionally, environmental condition can be added to the context plus some
      indication for general climatic conditions to demonstrate integration of sensor
      data via *Wetter* drop-down (remove option to change) 
      Context field can be edited or cleared (click *Löschen*)

   4. Generation 
      Prompt, query and context sent to LLM model, response displayed in **Antwort**


Model usage might involve access to remote LLM service, therefore **Login** to the backend is required (see *backend*)

Download option for all text fields: click **Download**


Samples for prompt, classfication and context in *public/data* 


## Backend 

Backend PHP code in *public/php*

Configure the file "users.csv" with entries for 

```csv
users, password, comment 
<user>,<hashed pwd>,<remember me>
```

accordingly.

Create password hash like so: 

```php
   <?php
   echo (password_hash("12341234", PASSWORD_DEFAULT));
```

The generated token is valid for 1 hour and equipped with a [*JTI* field](https://en.wikipedia.org/wiki/JSON_Web_Token). This is defined in the file *access.ini* like so: 

```
; access.ini - PHP INI style 
; Set JTI level 
 JTI="some value" 
```

Create credential files: run *php mkKey.php* 


**Warning**
*Don't store sensitive information in (users, keys etc) in your repositiory. For production, move 
the files to a save location given via basedir.txt and remove them for the php folder.*


## Build

### Dev prerequisites

**LLM**

Either local ollama/llamacpp installation in server mode (API) 
**or**
access to OpenAI compatible remote LLM, e.g. deepinfra.com with API-token

create configuration file config.ini like so:

> [REMOTE]
   apiKey = <your key>
   llmodel = <your model>
   llurl = <your url, like https://api.deepinfra.com/v1/openai/chat/completions>

   [LOCAL]
   apiKey = <dummy key like 1234>
   llmodel = <your model>
   llurl = <your local ollama url>


**PHP server runing like so in project root**

> php -S localhost:9000 -t public 

**Install**

npm install 

npm run dev => local development 

npm run build => build deployable version

