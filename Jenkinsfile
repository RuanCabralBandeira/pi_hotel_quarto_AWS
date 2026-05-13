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

        stage('Start Application') {

            steps {

                bat 'node -v'
                bat 'npm -v'
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