FROM node:18.16.0 AS BUILD

ENV TZ=Europe/Brussels
RUN ln -snf /usr/share/zoneinfo/$TZ /etc/localtime && echo $TZ > /etc/timezone

WORKDIR /app

RUN printf "@metamaze:registry=https://npm.pkg.github.com/\n//npm.pkg.github.com/:_authToken=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\ntimeout=1200000" > .npmrc

# Add package.json and install *before* adding application files
COPY package.json ./
COPY yarn.lock ./

RUN yarn install --frozen-lockfile

# Copy all the content to the working directory
COPY . .

ENV NO_COLOR=1

RUN yarn build

EXPOSE 4000

CMD ["yarn", "nest", "start"]
