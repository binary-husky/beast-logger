from setuptools import setup, find_packages
import re

# 读取版本号
def get_version():
    version_match = "0.0.1"
    return version_match

version = get_version()

# 读取长描述
with open("README.md", "r", encoding="utf-8") as f:
    long_description = f.read()

setup(
    name="best_logger",
    version=version,
    author="liuboyin.lby@alibaba-inc.com",
    author_email="liuboyin.lby@alibaba-inc.com",
    description="A package for atomic evaluation tools and utilities",
    long_description=long_description,
    long_description_content_type="text/markdown",
    url="https://code.alibaba-inc.com/DAIL-LLM/best_logger",
    packages=find_packages(),
    include_package_data=True,
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
        "Topic :: Software Development :: Libraries :: Python Modules",
    ],
    python_requires=">=3.7",
    install_requires=open("requirements.txt").read().splitlines(),
    entry_points={
        "console_scripts": [
            "simple_eval=best_logger.simple_eval:main",
        ],
    },
    project_urls={
        "Bug Reports": "https://code.alibaba-inc.com/DAIL-LLM/best_logger/issues",
        "Source": "https://code.alibaba-inc.com/DAIL-LLM/best_logger",
    },
)