pipeline {

    agent any

    stages {

        stage('Install Dependencies') {

            steps {

                bat 'npm install'
            }
        }

        stage('Prisma Generate') {

            steps {

                bat 'npx prisma generate'
            }
        }

        stage('Docker Build') {

            steps {

                bat 'docker compose build'
            }
        }

        stage('Docker Up') {

            steps {

                bat 'docker compose up -d'
            }
        }

        stage('Docker PS') {

            steps {

                bat 'docker ps'
            }
        }
    }

    post {

        success {

            echo 'Pipeline executada com sucesso!'
        }

        failure {

            echo 'Erro na pipeline!'
        }
    }
}