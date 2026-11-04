"""Retrieve official origins, keeping failures distinct from verified numbers."""
from concurrent.futures import ThreadPoolExecutor
from pathlib import Path
import json
import requests
import fitz

SOURCES = {
    "pt": "https://ec.europa.eu/eurostat/statistics-explained/SEPDF/cache/7515.pdf",
    "kr": "https://www.kostat.go.kr/boardDownload.es?bid=11113&list_no=435195&seq=4",
    "jp": "https://www.mhlw.go.jp/toukei/itiran/roudou/chingin/kouzou/z2024/dl/01.pdf",
    "cn": "https://www.stats.gov.cn/english/PressRelease/202505/t20250520_1959885.html",
    "us": "https://www.bls.gov/news.release/wkyeng.t07.htm",
    "in": "https://mospi.gov.in/sites/default/files/publication_reports/AnnualReport_PLFS2023-24L2.pdf",
    "ar_wage": "https://www.indec.gob.ar/uploads/informesdeprensa/ingresos_4trim24D779BFC8BE.pdf",
    "ar_prices": "https://www.indec.gob.ar/uploads/informesdeprensa/ipc_01_2517A7124C09.pdf",
    "za": "https://www.statssa.gov.za/publications/P0277/P0277December2025.pdf",
    "prices": "https://api.worldbank.org/v2/country/PRT;KOR;JPN;CHN;USA;BRA;ARG;ZAF;IND/indicator/PA.NUS.PRVT.PP?date=2023&format=json&per_page=100",
    "fx": "https://api.worldbank.org/v2/country/PRT;KOR;JPN;CHN;USA;BRA;ARG;ZAF;IND/indicator/PA.NUS.FCRF?date=2023&format=json&per_page=100",
}

def fetch(item):
    key, url = item
    try:
        response = requests.get(url, timeout=(10, 25))
        response.raise_for_status()
        if response.content.startswith(b"%PDF"):
            with fitz.open(stream=response.content, filetype="pdf") as doc:
                text = "\n".join(page.get_text() for page in doc)
        else:
            text = response.text
        if not text.strip():
            raise ValueError("No extractable source text")
        return key, {"url": url, "status": "opened", "text": text}
    except Exception as exc:
        return key, {"url": url, "status": "failed", "error": str(exc)}

if __name__ == "__main__":
    out = Path("_tmp/slice2-sources")
    out.mkdir(parents=True, exist_ok=True)
    with ThreadPoolExecutor(max_workers=3) as pool:
        results = dict(pool.map(fetch, SOURCES.items()))
    (out / "origins.json").write_text(json.dumps(results, ensure_ascii=False, indent=2), encoding="utf-8")
    for key, result in results.items():
        print(key, result["status"], len(result.get("text", "")), result.get("error", ""))
