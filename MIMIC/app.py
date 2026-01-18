from flask import Flask, render_template, send_from_directory
import os

app = Flask(__name__, template_folder='.')

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/mindmap.mmd')
def get_mindmap():
    return send_from_directory('.', 'mindmap.mmd')

@app.route('/js/<path:path>')
def send_js(path):
    return send_from_directory('js', path)

if __name__ == '__main__':
    app.run(debug=True, port=5000)
