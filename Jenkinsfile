pipeline {

    agent any

    stages {

        stage('Install') {

            steps {
                sh 'npm install'
            }
        }

        stage('Prisma Generate') {

            steps {
                sh 'npx prisma generate'
            }
        }

        stage('Docker Build') {

            steps {
                sh 'docker compose build'
            }
        }

        stage('Docker Up') {

            steps {
                sh 'docker compose up -d'
            }
        }
    }
}