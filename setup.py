from setuptools import setup, find_packages
import re
import os

# 读取版本号
def get_version():
    version_match = "0.0.5"
    return version_match

version = get_version()

def package_files(directory, black_list):
    paths = []
    for (path, directories, filenames) in os.walk(directory):
        for filename in filenames:
            if not any([k in filename or k in path for k in black_list]):
                paths.append(os.path.join('..', path, filename))
            else:
                print('ignore', filename)
    return paths


extra_files = package_files(
    'web_display',
    black_list=['node_modules', 'logs', 'dist', 'build', '__pycache__']
)

# 读取长描述
with open("README.md", "r", encoding="utf-8") as f:
    long_description = f.read()

setup(
    name="beast-logger",
    version=version,
    author="qingxu.fu@alibaba-inc.com",
    author_email="qingxu.fu@alibaba-inc.com",
    description="A package for atomic evaluation tools and utilities",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://code.alibaba-inc.com/DAIL-LLM/best_logger",
    packages=find_packages(),
    include_package_data=True,
    package_data={"": extra_files},
    classifiers=[
        "Development Status :: 3 - Alpha",
        "Intended Audience :: Developers",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.7",
        "Programming Language :: Python :: 3.8",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "Programming Language :: Python :: 3.13",
        "Topic :: Software Development :: Libraries :: Python Modules",
    ],
    python_requires=">=3.7",
    install_requires=open("requirements.txt").read().splitlines(),
    entry_points={
        "console_scripts": [
            # "best-logger-web=best_logger.web_launcher:main",
        ],
    },
    project_urls={
        "Bug Reports": "https://code.alibaba-inc.com/DAIL-LLM/best_logger/issues",
        "Source": "https://code.alibaba-inc.com/DAIL-LLM/best_logger",
    },
)
