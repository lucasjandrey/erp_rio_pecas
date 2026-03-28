from pathlib import Path
import matplotlib.pyplot as plt
import pandas as pd


ROOT = Path(__file__).resolve().parents[2]
SOURCE = Path(r"C:\Users\JhonFaker\Downloads\29.01.2026 CONTROLE FINANCEIRO.xlsx")
OUTPUT = ROOT / "data" / "reports" / "cashflow_forecast.png"


def main() -> None:
    sheet = pd.read_excel(SOURCE, sheet_name="SALDO CONTAS")
    sheet["DATA"] = pd.to_datetime(sheet["DATA"], errors="coerce")
    sheet["SALDO"] = pd.to_numeric(sheet["SALDO"], errors="coerce").fillna(0)

    plt.figure(figsize=(10, 4))
    plt.plot(sheet["DATA"], sheet["SALDO"], color="#006d77", linewidth=2)
    plt.title("Evolução do Saldo Consolidado")
    plt.xlabel("Data")
    plt.ylabel("Saldo")
    plt.tight_layout()
    plt.savefig(OUTPUT)
    print(f"Gráfico salvo em {OUTPUT}")


if __name__ == "__main__":
    main()
