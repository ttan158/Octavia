import modal
import os

app = modal.App("Octavia")

image = (
    modal.Image.debian_slim()
    .apt_install("git")
    .pip_install_from_requirements("requirements.txt")
    .run_commands(["git clone https://github.com/ace-step/ACE-Step.git /tmp/ACE-Step", "cd /tmp/ACE-Step && pip install ."])
    .env({"HF_HOME": "/.cache/huggingface"})
    .add_local_python_source("prompts")
)

model_volume = modal.Volume.from_name("ace-step-models", create_if_missing=True)
hf_volume = modal.Volume.from_name("qwen-hf-cache", create_if_missing=True)

octavia_secrets = modal.Secret.from_name("octavia-secrets")

@app.function(image=image, secrets=[modal.Secret.from_name("octavia-secrets")])
def function_test():
    print("Hello World")
    print(os.environ["test"])

@app.local_entrypoint()
def main():
    function_test.remote()