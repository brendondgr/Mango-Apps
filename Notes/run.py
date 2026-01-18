import uvicorn
import os
import socket

def get_local_ip():
    """Detect the local IP address of the machine."""
    try:
        # Create a dummy socket to detect the preferred local IP
        s = socket.socket(socket.AF_INET, socket.SOCK_DGRAM)
        s.connect(("8.8.8.8", 80))
        local_ip = s.getsockname()[0]
        s.close()
        return local_ip
    except Exception:
        return "127.0.0.1"

if __name__ == "__main__":
    # Ensure the core.asgi is discoverable
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    
    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", 9000))
    
    local_ip = get_local_ip()
    
    print("\n" + "="*50)
    print(f"🚀 Visualizers App Starting!")
    print(f"  - Local access:   http://127.0.0.1:{port}")
    print(f"  - Network access: http://{local_ip}:{port}")
    print("="*50 + "\n")
    
    uvicorn.run(
        "core.asgi:application",
        host=host,
        port=port,
        reload=True,
        log_level="info"
    )
