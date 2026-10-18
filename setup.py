from setuptools import setup, find_packages

setup(
    name="privatereceipt",
    version="0.1.0",
    description="Zero-Leak Local Receipt & Expense Intelligence for Freelancers • Powered by Gemma 2",
    author="PrivateReceipt Contributors",
    packages=find_packages(),
    python_requires=">=3.9",
    entry_points={
        "console_scripts": [
            "privatereceipt=privatereceipt.cli:main",
        ],
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
    ],
)
