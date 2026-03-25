FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# 强制卸载 passlib，彻底杜绝兼容性问题
RUN pip uninstall -y passlib || true

# 打印已安装的包，方便调试
RUN pip list

COPY . .

# 打印 auth.py 内容，方便在构建日志中确认代码版本
RUN echo "=== auth.py 内容 ===" && cat auth.py && echo "=== 结束 ==="

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
