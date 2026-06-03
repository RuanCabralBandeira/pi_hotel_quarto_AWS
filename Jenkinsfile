pipeline {

    agent any

    stages {
        
         stage('Fetch Secrets') {
            steps {
                sh 'npx -y @infisical/cli export --env="dev" --path="/quarto" --token="st.0f20435c-cc8b-4f06-8409-66d5cf392ad3.161752b8e21c58feeeba8cb68067cd37.a9504cd622815cea2d12e004cbf37e42" > .env'
            }
        }

        stage('Install Dependencies') {

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

        stage('Docker PS') {

            steps {

                sh 'node -v'
                sh 'npm -v'
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
