// Vercel Serverless Function: CV View / Download Handler
// Reads the CV document path from Firestore and redirects to the actual PDF file

module.exports = async function handler(req, res) {
    // CORS headers
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

    if (req.method === 'OPTIONS') {
        return res.status(200).end();
    }

    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        const action = req.query.action || 'view'; // 'view' or 'download'

        // Fetch CV document from Firestore via REST API
        const projectId = 'portfolio-dab96';
        const firestoreUrl = `https://firestore.googleapis.com/v1/projects/${projectId}/databases/(default)/documents/cv/current`;

        const firestoreRes = await fetch(firestoreUrl);

        if (!firestoreRes.ok) {
            console.error('Firestore read failed:', await firestoreRes.text());
            return res.status(404).json({ error: 'CV document not found in database.' });
        }

        const docData = await firestoreRes.json();
        const fields = docData.fields || {};

        // Extract pdf_path from the Firestore document
        const pdfPath = fields.pdf_path ? fields.pdf_path.stringValue : null;

        if (!pdfPath || !pdfPath.trim()) {
            return res.status(404).json({ error: 'No CV PDF path configured. Please set it in the admin panel.' });
        }

        // Build the full URL to the PDF
        // If the path starts with '/', it's relative to the site root
        const host = req.headers.host || 'localhost';
        const protocol = req.headers['x-forwarded-proto'] || 'https';
        const fullUrl = pdfPath.startsWith('http') ? pdfPath : `${protocol}://${host}${pdfPath}`;

        if (action === 'download') {
            // Extract filename from path for the download
            const filename = pdfPath.split('/').pop() || 'Izaan_Shakil_CV.pdf';
            res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        }

        // Redirect to the actual PDF file
        return res.redirect(302, fullUrl);

    } catch (error) {
        console.error('CV handler error:', error);
        return res.status(500).json({ error: 'Something went wrong. Please try again later.' });
    }
};
