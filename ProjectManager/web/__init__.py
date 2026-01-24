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
    
    # Configure Jinja to look in local templates and global templates
    import jinja2
    import os
    
    # Use the existing loader (which already points to the app's template folder)
    # and add the global templates folder.
    pass  # We need to make sure we don't trigger the recursion bug.
    
    # Direct safe approach for global templates
    root_dir = os.path.dirname(os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))
    global_templates_new = os.path.join(root_dir, 'apps', 'web', 'templates')
    global_templates_old = os.path.join(root_dir, 'templates')
    
    # If app.jinja_loader is not already a ChoiceLoader, make it one
    my_loader = jinja2.ChoiceLoader([
        app.jinja_loader,
        jinja2.FileSystemLoader(global_templates_new),
        jinja2.FileSystemLoader(global_templates_old),
    ])
    app.jinja_loader = my_loader

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
