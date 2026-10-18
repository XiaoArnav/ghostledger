from setuptools import setup, find_packages

setup(
    name="ghostledger",
    version="1.0.0",
    description="GhostLedger // 2100 • Zero-Leak Air-Gapped Receipt & Expense Intelligence for Freelancers • Powered by Gemma 2",
    author="GhostLedger Contributors",
    url="https://github.com/XiaoArnav/ghost-ledger",
    project_urls={
        "Live Production": "https://ghostledger-topaz.vercel.app",
        "Source Code": "https://github.com/XiaoArnav/ghost-ledger",
        "Bug Tracker": "https://github.com/XiaoArnav/ghost-ledger/issues",
    },
    packages=find_packages(),
    python_requires=">=3.9",
    keywords=[
        "hacktoberfest",
        "hacktoberfest2026",
        "side-hustle",
        "gemma",
        "gemma2",
        "privacy",
        "receipt-scanner",
        "taxes",
        "schedule-c",
        "accounting",
        "freelance",
        "zero-leak",
        "air-gapped",
    ],
    entry_points={
        "console_scripts": [
            "ghostledger=privatereceipt.cli:main",
            "privatereceipt=privatereceipt.cli:main",
        ],
    },
    classifiers=[
        "Programming Language :: Python :: 3",
        "Programming Language :: Python :: 3.9",
        "Programming Language :: Python :: 3.10",
        "Programming Language :: Python :: 3.11",
        "Programming Language :: Python :: 3.12",
        "License :: OSI Approved :: MIT License",
        "Operating System :: OS Independent",
        "Topic :: Office/Business :: Financial :: Accounting",
        "Topic :: Security :: Cryptography",
    ],
)
