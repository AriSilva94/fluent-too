import type { LegalPack } from "./types";

export const ptBrLegal: LegalPack = {
  terms: {
    title: "Termos de uso",
    summary: "Estas regras valem para quem acessa e usa a Fluent Too. Ao criar uma conta, você concorda com elas.",
    sections: [
      {
        heading: "1. Sobre a plataforma",
        body: [
          "A Fluent Too é uma plataforma de estudo de idiomas com quizzes por nível, materiais de apoio e registro de progresso.",
          "O acesso ao conteúdo público não exige cadastro. Salvar progresso, criar quizzes e revisar candidaturas exigem uma conta.",
        ],
      },
      {
        heading: "2. Sua conta",
        body: [
          "Você é responsável pelos dados informados no cadastro e por manter sua senha em sigilo.",
          "Contas são pessoais e intransferíveis. Se identificar uso indevido da sua conta, avise pelo e-mail {email}.",
          "A conta pode ser criada com e-mail e senha ou pelo login do Google.",
        ],
      },
      {
        heading: "3. Perfis e permissões",
        body: [
          "Aluno responde quizzes e acompanha o próprio histórico.",
          "Professor pode criar e editar quizzes nos idiomas aprovados na candidatura, que passa por análise manual da equipe.",
          "A aprovação de uma candidatura é uma decisão da Fluent Too e pode ser revista se as regras destes termos forem descumpridas.",
        ],
      },
      {
        heading: "4. Conteúdo publicado por você",
        body: [
          "Ao publicar quizzes ou materiais, você declara ter os direitos necessários sobre esse conteúdo e autoriza a Fluent Too a exibi-lo na plataforma.",
          "Você continua sendo o titular do que criou.",
          "Conteúdo que viole direitos de terceiros, contenha discurso de ódio ou informação enganosa pode ser despublicado.",
        ],
      },
      {
        heading: "5. Uso adequado",
        body: [
          "Não é permitido tentar acessar contas de outras pessoas, contornar as regras de permissão, extrair dados de forma automatizada ou sobrecarregar a plataforma.",
          "O descumprimento pode levar à suspensão ou ao encerramento da conta.",
        ],
      },
      {
        heading: "6. Disponibilidade e mudanças",
        body: [
          "A plataforma está em evolução contínua: recursos podem ser adicionados, alterados ou removidos.",
          "Fazemos o possível para manter o serviço no ar, mas ele é oferecido no estado em que se encontra, sem garantia de disponibilidade ininterrupta.",
        ],
      },
      {
        heading: "7. Encerramento",
        body: [
          "Você pode pedir o encerramento da sua conta a qualquer momento pelo e-mail {email}.",
          "Podemos encerrar contas que violem estes termos, com aviso sempre que possível.",
        ],
      },
      {
        heading: "8. Limitação de responsabilidade",
        body: [
          "O conteúdo de estudo tem finalidade educacional e não substitui acompanhamento profissional ou certificação oficial de idiomas.",
          "Não nos responsabilizamos por danos indiretos decorrentes do uso da plataforma, no limite permitido pela lei.",
        ],
      },
      {
        heading: "9. Lei aplicável",
        body: ["Estes termos são regidos pela legislação brasileira."],
      },
      {
        heading: "10. Contato",
        body: ["Dúvidas sobre estes termos: {email}."],
      },
    ],
  },
  privacy: {
    title: "Política de privacidade",
    summary: "Como a Fluent Too coleta, usa e protege seus dados pessoais, conforme a Lei Geral de Proteção de Dados (LGPD).",
    sections: [
      {
        heading: "1. Dados que coletamos",
        body: [
          "Cadastro: e-mail, nome de usuário e senha (armazenada apenas de forma criptografada).",
          "Uso da plataforma: quizzes respondidos, notas, data das respostas e idioma de estudo escolhido.",
          "Candidatura a professor: biografia, experiência, idiomas que ensina e, quando enviados, link de credencial e arquivo anexo.",
          "Login pelo Google: e-mail e nome básico da conta, quando você opta por esse método.",
        ],
      },
      {
        heading: "2. Para que usamos",
        body: [
          "Autenticar seu acesso e manter sua sessão ativa.",
          "Registrar e exibir seu progresso de estudo.",
          "Analisar candidaturas de professor e comunicar a decisão.",
          "Enviar e-mails operacionais, como confirmação de cadastro e redefinição de senha.",
        ],
      },
      {
        heading: "3. Bases legais",
        body: [
          "Execução do contrato, para tudo que é necessário ao funcionamento da sua conta.",
          "Consentimento, no envio de documentos na candidatura de professor.",
          "Cumprimento de obrigação legal e legítimo interesse, para segurança e prevenção a abusos.",
        ],
      },
      {
        heading: "4. Cookies",
        body: [
          "Usamos cookies estritamente necessários para manter você autenticado e lembrar o idioma escolhido.",
          "Não usamos cookies de publicidade nem de rastreamento entre sites.",
        ],
      },
      {
        heading: "5. Compartilhamento",
        body: [
          "Não vendemos dados pessoais.",
          "Compartilhamos apenas com fornecedores necessários à operação, como hospedagem, banco de dados e envio de e-mail, e com o Google quando você escolhe o login social.",
        ],
      },
      {
        heading: "6. Retenção",
        body: [
          "Mantemos seus dados enquanto sua conta existir.",
          "Após o encerramento, removemos ou anonimizamos os dados, salvo o que precisar ser mantido por obrigação legal.",
        ],
      },
      {
        heading: "7. Seus direitos",
        body: [
          "Você pode pedir acesso, correção, portabilidade, anonimização ou exclusão dos seus dados, além de revogar consentimentos.",
          "Para exercer qualquer desses direitos, escreva para {email}. Respondemos em até 15 dias.",
        ],
      },
      {
        heading: "8. Segurança",
        body: [
          "Senhas são armazenadas com hash, o tráfego é protegido por HTTPS e o acesso administrativo é restrito por perfil de permissão.",
          "Nenhum sistema é totalmente imune a incidentes; em caso de violação relevante, comunicaremos os titulares e a ANPD.",
        ],
      },
      {
        heading: "9. Crianças e adolescentes",
        body: [
          "Menores de 16 anos só devem usar a plataforma com consentimento de um responsável legal.",
        ],
      },
      {
        heading: "10. Alterações",
        body: [
          "Podemos atualizar esta política. A data da última atualização fica indicada no topo desta página.",
        ],
      },
      {
        heading: "11. Contato",
        body: ["Dúvidas sobre privacidade e proteção de dados: {email}."],
      },
    ],
  },
};
