import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()
const icd = [
  {code:"J06.9", nama:"ISPA / Acute upper respiratory infection"},
  {code:"J00", nama:"Common Cold"},
  {code:"R51", nama:"Pusing / Headache"},
  {code:"K29.7", nama:"Gastritis"},
  {code:"A09", nama:"Diare / Gastroenteritis"},
  {code:"J45", nama:"Asma"},
  {code:"I10", nama:"Hipertensi"},
  {code:"E11", nama:"Diabetes Mellitus Type 2"},
]
const obat = [
  {nama:"Parasetamol 500mg", stok:100, satuan:"tablet"},
  {nama:"Amoxicillin 500mg", stok:50, satuan:"kapsul"},
  {nama:"Antasida", stok:50, satuan:"tablet"},
  {nama:"Cetirizine 10mg", stok:50, satuan:"tablet"},
]
async function main(){
  for(const i of icd) await prisma.iCD10.upsert({where:{code:i.code}, update:{nama:i.nama}, create:i})
  for(const o of obat) await prisma.obat.upsert({where:{nama:o.nama}, update:{}, create:o})
  console.log("Seed done")
}
main()
