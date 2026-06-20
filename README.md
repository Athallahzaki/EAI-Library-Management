# EAI-Library-Management
Tugas Besar Enterprise Application Development - Membuat Aplikasi Terintegrasi Menggunakan GraphQL API dan Docker

Project Library Management - Manajemen Perpustakaan, Sistem Peminjaman dan Pemgembalian Buku, dan Pengelolaan Denda

## Tech Stack

**Backend:** NodeJS, Apollo Server, GraphQL

**Frontend:** Simple HTML, CSS, JS, Nginx Web Server

**Database:** Mysql Server

# Setup Project

## Prerequisites

Before you begin, make sure you have the following prerequisites installed on your system:

-   [Docker Engine](https://www.docker.com/) Latest version.
-   [Docker Desktop](https://www.docker.com/products/docker-desktop/) Easy maintenance of docker containers.

## Step 1: Clone The Repository

```bash
  git clone https://github.com/Athallahzaki/EAI-Library-Management.git
```

## Step 2: Open Project Folder

Navigate to project root directory:

```bash
  cd EAI-Library-Management
```

## Step 3: Create .env files

In this step you can open your preferred code editor or IDE or stick to the terminal.

### linux system

linux bash

```bash
  cp .env.example .env
```

### windows system

On windows, there are 2 terminals that have different syntax:

1. windows command prompt

```bash
  cat .env.example > .env
```

2. windows powershell

```bash
  cp .env.example .env
```

### Another way

```
  Or you can copy .env.example manually and rename it to .env
```

## Step 4: Configure Your .env file

Edit the .env file that you copied earlier.

```
  API_HOST=localhost
  API_PORT=4000

  DB_HOST=db
  DB_PORT=3306
  DB_USER=lib-man
  DB_PASSWORD=lib-man
  DB_NAME=library_db

  GOOGLE_KEY= #This is optional, but you will be limited by google's rate limiter
```

## Step 5: Configure docker-compose.yml
```
You can change the parameters of the compose file if you want.
Change the nginx port to whatever you want it be.
But it is recommended to keep everything as-is if you dont know what you are doing.
```
## Step 6: Run the Containers

Run this command in the terminal to start all containers in docker.

```bash
  docker compose up -d --build
```

## Step 7: Accessing the Server

You can now access the server by opening a browser or using tools like postman and going to this site.

```
  http://localhost:20005/ (Main rontend Site)
  http://localhost:20005/graphql/ (API Endpoint and Apollo Sandbox UI)
```

# The Team
- 102022430057 - Naila Zahra
- 102022400239 - Rheza Prathama Gunawan
- 102022400193 - Muhammad Athhar Malika Putra
- 102022400018 - Muhammad Rafa Aimar
- 102022400301 - Muhammad Zaki At Hallah Putra Pratama
