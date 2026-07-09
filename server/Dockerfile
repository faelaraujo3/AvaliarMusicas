FROM python:3.12-slim

WORKDIR /app

# Copia as dependências e instala dentro do container
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copia o código app.py para dentro do container
COPY . .

# Porta padrão do Flask
EXPOSE 5000

# Comando para iniciar o servidor
CMD ["python", "app.py"]