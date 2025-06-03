from setuptools import setup, find_packages

setup(
    name='your_protobuf_package',
    version='0.1.0',
    packages=find_packages(),
    install_requires=[
        'grpcio>=1.0.0',
        'protobuf>=3.0.0',
    ],
    author='Stanislav Fedii',
    author_email='stanislav.fedii@gmail.com',
    description='Generated Protobuf code',
    url='https://github.com/stanterprise/protobuf',
    classifiers=[
        'Programming Language :: Python :: 3',
    ],
)