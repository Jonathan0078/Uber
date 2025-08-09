#!/usr/bin/env python3
"""
WSGI configuration for Uber App backend on PythonAnywhere

This file exposes the WSGI callable as a module-level variable named ``application``.
For more information on this file, see:
https://help.pythonanywhere.com/pages/Flask/
"""

import sys
import os

# Add your project directory to the sys.path
# Replace 'JonathanOliveira' with your actual PythonAnywhere username
path = '/home/JonathanOliveira/Uber/backend'
if path not in sys.path:
    sys.path.append(path)

# Add the src directory to the path
src_path = '/home/JonathanOliveira/Uber/backend/src'
if src_path not in sys.path:
    sys.path.insert(0, src_path)

# Import your Flask application
from main import app as application

if __name__ == "__main__":
    application.run()

