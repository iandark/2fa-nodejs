# 2FA with NodeJS


Simple application to implement 2FA with NodeJS

### Reference

This code is a fork from a repo by [Kanayama](https://github.com/askmon), thanks man for your great lessons!  :thumbsup:

### Requirements

- Node.js v14 (`.nvmrc` available in the source)
- PostgreSQL databse (there's docker-compose in the source code)


### What you should do first

Rename the file `.env.example` to `.env`

### Available commands

| Command                           | Description                                                                              |
| --------------------------------- | ---------------------------------------------------------------------------------------- |
| `npm install`                     | It installs the dependations inside package.json, and creates the `.node_modules` folder |
| `docker-compose up`               | To create your local PostgreSQL database with docker compose                             |
| `npm run sequelize:migrate`       | To create the tables                                                                     |
| `npm run sequelize:seed`          | To create the data for the tables                                                        |
| `npm run dev`                     | To run the prokect using nodemon                                                         |

### Postman collection

You can get the postman collection for this project [here](https://gist.github.com/iandark/584ee9f0582aeec6939d0aaf285748e4)
