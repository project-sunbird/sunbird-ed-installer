import os
import jwt
import sys

# Predefined map of keys and secrets
consumer_list = ["api_admin", "mobile_admin", "mobile_device", "mobile_devicev2", "portal_anonymous_register", "portal_loggedin_register", "portal_anonymous", "portal_loggedin", "portal_anonymous_fallback_token", "portal_loggedin_fallback_token", "adminutil_learner_api_token"]

def generate_jwt_token(key, secret, random_string):
    # Concatenate the random string to the secret
    secret_with_random = secret + random_string

    # Create the token payload
    payload = {
        "iss": key
    }

    # Generate the JWT token
    jwt_token = jwt.encode(payload, secret_with_random, algorithm="HS256")

    return jwt_token

def replace_placeholders(template_content, token_dict):
    for key, token in token_dict.items():
        placeholder = f"{{{{{key}}}}}"
        template_content = template_content.replace(placeholder, token)

    return template_content

if __name__ == "__main__":
    # Check if the random string is provided as a command-line argument
    if len(sys.argv) != 2:
        print("Usage: python script.py <random_string>")
        sys.exit(1)

    random_string = sys.argv[1]

    # Validate the length of the random string
    if not (12 <= len(random_string) <= 24):
        print("Error: The random string must be between 12 and 24 characters in length.")
        sys.exit(1)

    # Get the script directory
    script_directory = os.path.dirname(os.path.realpath(__file__))

    # Construct the template file path relative to the script location
    template_file_name = os.path.join(script_directory, "global-values-jwt-tokens.yaml.tpl")

    # Generate JWT tokens for each key in the map
    token_dict = {}
    for consumer in consumer_list:
        token = generate_jwt_token(consumer, consumer, random_string)
        token_dict[f"{consumer}_jwt"] = token

    # Read the template file
    with open(template_file_name, "r") as template_file:
        template_content = template_file.read()

    # Replace placeholders with JWT tokens
    modified_content = replace_placeholders(template_content, token_dict)

    # Write the modified content to a new file
    output_file_name = os.path.join(script_directory,"global-values-jwt-tokens.yaml")
    with open(output_file_name, "w") as output_file:
        output_file.write(modified_content)

    print(f"Modified content written to {output_file_name}")