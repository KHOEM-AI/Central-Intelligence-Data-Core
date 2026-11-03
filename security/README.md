# File Integrity Protection (security/)

ផ្នែកនេះជាផ្នែកបន្ថែមរបស់ CIDC — ប្រព័ន្ធការពារដាច់ដោយឡែក ពិនិត្យភាពត្រឹមត្រូវនៃឯកសារ (SHA-256) គ្រប់គម្រោង KHOEM-AI។ មិនទាក់ទងនឹង data core ចម្បងរបស់ CIDC ទេ។

    node security/file-integrity/integrity.mjs init    # កំណត់ baseline ទុកចិត្ត
    node security/file-integrity/integrity.mjs check   # ពិនិត្យការផ្លាស់ប្ដូរ

គម្រោងដែលតាមដាន កំណត់ក្នុង `security/file-integrity/roots.json`. ហៅពី AI backend (:8787) តាម `/api/integrity`។
