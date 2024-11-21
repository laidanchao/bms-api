FROM public.ecr.aws/n0r2y8g6/base:cms-api
ENV PLAYWRIGHT_BROWSERS_PATH=/ms-playwright
RUN npm i playwright@1.17.0
RUN chmod -R 777 /ms-playwright
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build
RUN cp -rf src/assets dist/src/
RUN ls dist/src/assets/wsdl/colissimo/Label.wsdl
CMD [ "sh", "-c", "npm run $APP" ]
