const nodemailer = require('nodemailer');

class EmailService {
  constructor() {
    this.transporter = null;
    this.initializeTransporter();
  }

  initializeTransporter() {
    if (process.env.EMAIL_HOST && process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      this.transporter = nodemailer.createTransport({
        host: process.env.EMAIL_HOST,
        port: process.env.EMAIL_PORT || 587,
        secure: process.env.EMAIL_PORT === '465',
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASS
        }
      });
    } else {
      console.warn('Configuración de email no encontrada. Las notificaciones por email estarán deshabilitadas.');
    }
  }

  async sendEmail(to, subject, htmlContent, textContent = null) {
    if (!this.transporter) {
      console.warn('Transporter de email no inicializado');
      return false;
    }

    try {
      const mailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_USER,
        to: to,
        subject: subject,
        html: htmlContent,
        text: textContent || this.stripHtml(htmlContent)
      };

      const info = await this.transporter.sendMail(mailOptions);
      console.log('Email enviado:', info.messageId);
      return true;
    } catch (error) {
      console.error('Error enviando email:', error);
      return false;
    }
  }

  stripHtml(html) {
    return html.replace(/<[^>]*>/g, '');
  }

  // Plantillas de email
  async sendContenidoNotification(userEmail, userName, contenido) {
    const subject = `Nuevo contenido disponible: ${contenido.titulo}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2c3e50;">¡Nuevo contenido disponible!</h2>
        <p>Hola ${userName},</p>
        <p>Se ha publicado nuevo contenido en tu materia:</p>
        <div style="background-color: #f8f9fa; padding: 15px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #3498db; margin-top: 0;">${contenido.titulo}</h3>
          <p><strong>Materia:</strong> ${contenido.materia_nombre}</p>
          <p><strong>Semana:</strong> ${contenido.semana}</p>
          <p><strong>Tipo:</strong> ${contenido.tipo_contenido}</p>
          ${contenido.descripcion ? `<p><strong>Descripción:</strong> ${contenido.descripcion}</p>` : ''}
          ${contenido.link_contenido ? `<p><a href="${contenido.link_contenido}" style="color: #3498db;">Ver contenido</a></p>` : ''}
        </div>
        <p>¡No te pierdas esta información importante!</p>
        <p>Saludos,<br>Equipo TUPAD</p>
      </div>
    `;

    return await this.sendEmail(userEmail, subject, html);
  }

  async sendEvaluacionNotification(userEmail, userName, evaluacion) {
    const subject = `Evaluación próxima: ${evaluacion.titulo}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #e74c3c;">¡Evaluación próxima!</h2>
        <p>Hola ${userName},</p>
        <p>Tienes una evaluación próxima:</p>
        <div style="background-color: #fdf2f2; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #e74c3c;">
          <h3 style="color: #e74c3c; margin-top: 0;">${evaluacion.titulo}</h3>
          <p><strong>Materia:</strong> ${evaluacion.materia_nombre}</p>
          <p><strong>Fecha:</strong> ${new Date(evaluacion.fecha_evaluacion).toLocaleDateString('es-AR')}</p>
          ${evaluacion.hora_inicio ? `<p><strong>Hora:</strong> ${evaluacion.hora_inicio} - ${evaluacion.hora_fin}</p>` : ''}
          <p><strong>Tipo:</strong> ${evaluacion.tipo_evaluacion}</p>
          ${evaluacion.descripcion ? `<p><strong>Descripción:</strong> ${evaluacion.descripcion}</p>` : ''}
          ${evaluacion.link_evaluacion ? `<p><a href="${evaluacion.link_evaluacion}" style="color: #3498db;">Ver detalles</a></p>` : ''}
        </div>
        <p>¡Prepárate bien para esta evaluación!</p>
        <p>Saludos,<br>Equipo TUPAD</p>
      </div>
    `;

    return await this.sendEmail(userEmail, subject, html);
  }

  async sendRecordatorioNotification(userEmail, userName, recordatorio) {
    const subject = `Recordatorio: ${recordatorio.titulo}`;
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #f39c12;">Recordatorio</h2>
        <p>Hola ${userName},</p>
        <p>Te recordamos:</p>
        <div style="background-color: #fef9e7; padding: 15px; border-radius: 5px; margin: 20px 0; border-left: 4px solid #f39c12;">
          <h3 style="color: #f39c12; margin-top: 0;">${recordatorio.titulo}</h3>
          <p>${recordatorio.mensaje}</p>
        </div>
        <p>¡No olvides revisar tu agenda académica!</p>
        <p>Saludos,<br>Equipo TUPAD</p>
      </div>
    `;

    return await this.sendEmail(userEmail, subject, html);
  }

  async sendWelcomeEmail(userEmail, userName) {
    const subject = '¡Bienvenido a TUPAD Organizador Académico!';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #27ae60;">¡Bienvenido a TUPAD!</h2>
        <p>Hola ${userName},</p>
        <p>¡Te damos la bienvenida al sistema de organización académica de TUPAD!</p>
        <p>Con esta herramienta podrás:</p>
        <ul>
          <li>Ver tus horarios de cursada</li>
          <li>Acceder a contenidos de materias</li>
          <li>Revisar evaluaciones y notas</li>
          <li>Recibir notificaciones importantes</li>
        </ul>
        <p>¡Que tengas un excelente semestre académico!</p>
        <p>Saludos,<br>Equipo TUPAD</p>
      </div>
    `;

    return await this.sendEmail(userEmail, subject, html);
  }
}

module.exports = new EmailService();