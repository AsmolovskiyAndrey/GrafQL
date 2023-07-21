


export const accessToken = async () => {
    const promise = new Promise(async (resolve, reject) => {
        const response = await fetch(OAUTH_URL, {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
        },
        body: `grant_type=client_credentials
            &client_id=${CLIENT_ID}
            &client_secret=${CLIENT_SECRET}
            &resource=${RESOURCE_ID}`,
        });

        resolve(response.json());
    });

    const json = await promise;
    return json["access_token"];
};

export const authMiddleware = setContext(
    (request) =>
        new Promise(async (resolve, reject) => {
        const token = await accessToken();
        resolve({
            headers: {
            authorization: `Bearer ${token}`,
            },
        });
    })
);