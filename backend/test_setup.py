def test_imports():
    try:
        import flask
        import flask_cors
        import flask_sqlalchemy
        import bcrypt
        import flask_limiter
        import pyotp
        import PIL
        print("Basic dependencies imported successfully!")
        
        try:
            import torch
            import transformers
            print("ML dependencies imported successfully!")
        except ImportError as e:
            print(f"ML dependencies import failed: {e}")
            print("Note: ML features will not be available")
        
        return True
    except ImportError as e:
        print(f"Import failed: {e}")
        return False

if __name__ == "__main__":
    test_imports() 