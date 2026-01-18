# ShortSpork Project Structure

```
ShortSpork/
├── .env.example          # Environment variable template
├── .gitignore            # Git ignore rules
├── .python-version       # Python version specification
├── README.md             # Project documentation
├── app.py                # Flask application entry point
├── pyproject.toml        # Python project configuration
├── requirements.txt      # Python dependencies
│
├── docs/                 # Documentation
│   ├── application.md    # Application overview
│   ├── plans.md          # Development plans
│   ├── ui.md             # UI/Design system documentation
│   └── rule7-implementation-plan.md  # Detailed implementation plan for Rule 7
│
├── rules/                # AI bot guidelines
│   ├── details.md        # File/class/function reference
│   └── structure.md      # This file - project structure
│
├── utils/                # Utility modules
│   └── (future modules)
│
└── web/                  # Web application
    ├── static/           # Static assets
    │   ├── css/          # Stylesheets
    │   │   ├── spices.css      # Design system variables
    │   │   ├── plating.css     # Base styles & reset
    │   │   ├── components.css  # UI components (buttons, cards, badges, forms)
    │   │   ├── navigation.css  # Navigation & layout styling
    │   │   └── garnishes.css   # Animations & micro-interactions
    │   ├── js/           # JavaScript files
    │   └── images/       # Image assets
    │
    └── templates/        # Jinja2 templates
        ├── kitchen.html  # Base template
        └── index.html    # Homepage template
```
