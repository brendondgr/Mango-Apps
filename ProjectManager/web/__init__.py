from flask import Flask
from flask_sqlalchemy import SQLAlchemy

# Import Config from ProjectManager's config module (not Django's config package)
from apps.ProjectManager.config import Config

db = SQLAlchemy()

def create_app(config_class=Config):
    app = Flask(__name__,
                static_url_path='/pr/projects/static',
                static_folder='static',
                template_folder='templates')
    app.config.from_object(config_class)

    db.init_app(app)

    # Use absolute import for routes
    from apps.ProjectManager.web import routes
    app.register_blueprint(routes.bp)

    with app.app_context():
        # Import models to ensure they are registered with SQLAlchemy
        from apps.ProjectManager.web import models
        db.create_all()

    return app
