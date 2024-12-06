import mammoth from "mammoth";

export const convertDocxToHtml = async (fileBuffer: Uint8Array) => {
    const mammothResult = await mammoth.convertToHtml(
        { arrayBuffer: fileBuffer },
        {
            styleMap: [
                "p[style-name='Section Title'] => h1:fresh",
                "p[style-name='Subsection Title'] => h2:fresh",
            ],
            convertImage: mammoth.images.imgElement(async (image) => {
                try {
                    const imageBuffer = await image.read("base64");
                    return {
                        src: `data:${image.contentType};base64,${imageBuffer}`,
                        alt: ""
                    };
                } catch (error) {
                    console.error("Error converting image:", error);
                    return { src: "", alt: "" };
                }
            }),
        }
    );
    return mammothResult.value;
};
