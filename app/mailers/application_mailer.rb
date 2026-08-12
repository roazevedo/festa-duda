class ApplicationMailer < ActionMailer::Base
  # Remetente verificado no Resend. Sobrescrevível por MAIL_FROM em produção.
  default from: ENV.fetch("MAIL_FROM", "Convida.me <nao-responda@convidame.app>")
  layout "mailer"
end
