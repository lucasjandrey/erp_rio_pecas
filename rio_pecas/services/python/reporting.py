from pathlib import Path
import pandas as pd


ROOT = Path(__file__).resolve().parents[2]
SOURCE = Path(r"C:\Users\JhonFaker\Downloads\29.01.2026 CONTROLE FINANCEIRO.xlsx")
OUTPUT = ROOT / "data" / "reports" / "financial_summary.xlsx"


def main() -> None:
    launches = pd.read_excel(SOURCE, sheet_name="lançamentos")
    launches["R$ Receita"] = pd.to_numeric(launches["R$ Receita"], errors="coerce").fillna(0)
    launches["R$ Despesas"] = pd.to_numeric(launches["R$ Despesas"], errors="coerce").fillna(0)
    launches["Ano Negócio"] = pd.to_numeric(launches["Ano Negócio"], errors="coerce")
    launches["Mês Negócio"] = pd.to_numeric(launches["Mês Negócio"], errors="coerce")

    monthly = (
        launches.groupby(["Ano Negócio", "Mês Negócio"], dropna=False)[["R$ Receita", "R$ Despesas"]]
        .sum()
        .reset_index()
    )
    monthly["Resultado"] = monthly["R$ Receita"] - monthly["R$ Despesas"]

    with pd.ExcelWriter(OUTPUT, engine="openpyxl") as writer:
        launches.head(1000).to_excel(writer, sheet_name="amostra_lancamentos", index=False)
        monthly.to_excel(writer, sheet_name="resumo_mensal", index=False)

    print(f"Relatório salvo em {OUTPUT}")


if __name__ == "__main__":
    main()
