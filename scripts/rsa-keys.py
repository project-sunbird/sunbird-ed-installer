import argparse
from cryptography.hazmat.primitives import serialization
from cryptography.hazmat.primitives.asymmetric import rsa
from cryptography.hazmat.backends import default_backend
import os
import textwrap


def generate_key_pair(prefix, count):
    keys = {}

    for i in range(1, count + 1):
        private_key = rsa.generate_private_key(
            public_exponent=65537,
            key_size=2048,
            backend=default_backend()
        )

        # Serialize private key to PKCS#8 PEM format
        private_key_pem = private_key.private_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PrivateFormat.PKCS8,
            encryption_algorithm=serialization.NoEncryption()
        )

        public_key = private_key.public_key()

        # Serialize public key to PEM format
        public_key_pem = public_key.public_bytes(
            encoding=serialization.Encoding.PEM,
            format=serialization.PublicFormat.SubjectPublicKeyInfo
        )

        key_name = "{}{}{}".format(prefix, "_key", i)
        keys[key_name] = {
            "private_key": private_key_pem.decode("utf-8"),
            "public_key": public_key_pem.decode("utf-8")
        }

    return keys


def write_to_file(keys, filename):
    with open(filename, 'w') as file:
        for prefix, key_data in keys.items():
            file.write(f"{prefix}_private_keys:\n")
            for key_name, values in key_data.items():
                file.write(f"  {key_name}: |-\n")
                file.write(textwrap.indent(values['private_key'].lstrip(), '    '))
            file.write(f"{prefix}_public_keys:\n")
            for key_name, values in key_data.items():
                file.write(f"  {key_name}: |-\n")
                file.write(textwrap.indent(values['public_key'].lstrip(), '    '))


if __name__ == "__main__":
    parser = argparse.ArgumentParser(description="Generate and write RSA key pairs to a YAML file.")
    parser.add_argument("count", type=int, help="Number of keys to generate")
    args = parser.parse_args()

    prefixes = ["access_v1", "desktop_devicev2", "mobile_devicev2", "portal_anonymous", "portal_loggedin"]
    key_pairs = {prefix: generate_key_pair(prefix, args.count) for prefix in prefixes}
    script_directory = os.path.dirname(os.path.realpath(__file__))
    output_filename = os.path.join(script_directory, "global-values-rsa-keys.yaml")
    write_to_file(key_pairs, output_filename)

    print(f"Keys have been generated and written to {output_filename}")
