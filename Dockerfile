FROM node:alpine

LABEL version="0.1.0"

COPY ./ /assinaturas-api

RUN cd assinaturas-api && npm i

CMD cd assinaturas-api && npm start