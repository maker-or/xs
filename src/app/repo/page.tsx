"use client";
import React, { useState } from "react";
import Link from "next/link";
import Greeting from "~/components/ui/Greeting";
import Navbar from "~/components/ui/Navbar";
import { StepBack } from "lucide-react";


// Define the type for branches and structure for subjects, chapters, and notes.
const branches = [
  "CSE",
  "EEE",
  "ECE",
  "MEC",
  "CIV",
  "IT",
  "CSO",
  "CSM",
  "CIC",
  "AI",
] as const;
type Branch = (typeof branches)[number];
type Subject = Record<string, Record<string, string>>;
type SubjectsByBranch = Record<Branch, Subject>;

// Define subjects for different branches
const subjects: SubjectsByBranch = {
  CSE: {
    "DSA": {
      Notes:"https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSE%2FAI-All%20Units.pdf?alt=media&token=c57ad992-412f-436e-8d66-35a7abc83cf5",
      chapter1:'https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSE%2FAI%20-%20UNIT%20I%20R20.pdf?alt=media&token=0fc404c5-bcf6-47d4-a9c1-4bbb30133999',
      'chapter2':'https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSE%2FAI%20-%20UNIT%20II.pdf?alt=media&token=a0182391-b3df-48d0-939d-db6a821509e4',
      "Chapter 3":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSE%2FAI%20-%20UNIT%20III.pdf?alt=media&token=b454a389-fd14-4f44-9387-b9acb922e7cf",
      "Chapter 4":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSE%2FAI%20-%20UNIT%20IV.pdf?alt=media&token=830425f0-386c-4580-8084-9a2e3b711ef4",
      "Chapter 5":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSE%2FAI%20-%20UNIT%20V%20GRD.pdf?alt=media&token=a07c3c1a-5e3b-48af-8286-d9c5e2b23566",

    },
    "Java": {
      "Chapter 1":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSE%2FCN%2FCN%20UNIT%201.pdf?alt=media&token=8a3ffd90-ccde-4439-b8a6-e22862c9e9df",
      "Chapter 2":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSE%2FCN%2FCN%20UNIT%202.pdf?alt=media&token=172a3a1d-70d8-4036-a585-f54950674e6e",
      "Chapter 3":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSE%2FCN%2FCN%20UNIT%203.pdf?alt=media&token=e0f2543e-36fb-4835-a3b0-5c414a4c5b87",
      "Chapter 4":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSE%2FCN%2FCN%20UNIT%204.pdf?alt=media&token=806e04ca-eda9-428e-8235-c95c5ebc3544",
      "Chapter 5":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/404.png?alt=media&token=4ecab361-4c2e-461e-b5b2-49a49971361a",
    },
    'DAA': {
      "Chapter 1":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSE%2FDWM%2FDWDM%20Unit%201.pdf?alt=media&token=fdec5cef-9e2c-414e-8744-366f5a8361d7",
      "Chapter 2":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSE%2FDWM%2FDWDM%20Unit%202.pdf?alt=media&token=3a990ec6-f705-44ec-90a4-a654cbebc3a0",
      "Chapter 3-1":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSE%2FDWM%2FDWDM%20Unit%203_Part-1.pdf?alt=media&token=efd24687-2713-4676-b5be-82bfe1335e0b",
      "Chapter 3-2":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSE%2FDWM%2FDWDM%20Unit%203_Part-2.pdf?alt=media&token=17c474a2-e84b-4b2e-ae93-913a7d1bdd8c",
      "Chapter 4":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSE%2FDWM%2FDWDM%20Unit%204.pdf?alt=media&token=e487369e-7f3d-407a-b152-2ae342ebb97f",
      "Chapter 5":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSE%2FDWM%2FDWDM%20Unit%205.pdf?alt=media&token=c48d0fca-8fb3-40cf-909f-ff80d6347b5b",
      textbook:
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSE%2FDWM%2FVipin%20Kumar_Text%20Book.pdf?alt=media&token=35e87e92-5351-4b64-aa8c-7e8d197e90b8",
    },
    ADS: {
      "HTML":
        "https://developer.mozilla.org/en-US/docs/Web/HTML",
      "React":
        "https://react.dev/learn",
      "MongoDB":
        "https://www.mongodb.com/docs/manual/",
    },
    FLAT: {
      Textbook:
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSE%2FShyamalendu%20Kandar%20-%20Introduction%20to%20Automata%20Theory%2C%20Formal%20Languages%20and%20Computation-Pearson%20Education%20India%20(2016).pdf?alt=media&token=bc2608ce-5508-4004-9e55-621294be2027",
    },
  },
  EEE: {},
  ECE: {
    OOP: {
      "Chapter 1":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/404.png?alt=media&token=4ecab361-4c2e-461e-b5b2-49a49971361a",
      "Chapter 2":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/404.png?alt=media&token=4ecab361-4c2e-461e-b5b2-49a49971361a",
      "Chapter 3":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/404.png?alt=media&token=4ecab361-4c2e-461e-b5b2-49a49971361a",
      "Chapter 4":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/404.png?alt=media&token=4ecab361-4c2e-461e-b5b2-49a49971361a",
      "Chapter 5":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/404.png?alt=media&token=4ecab361-4c2e-461e-b5b2-49a49971361a",
    },
    ADC: {
      Notes:
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/EEE%2FADC%20COMPLETE%20NOTES.pdf?alt=media&token=b8e955f1-3072-4f4c-8573-b2ef087d1133",
    },
    "VlSI Design ": {
      "Chapter 1":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/404.png?alt=media&token=4ecab361-4c2e-461e-b5b2-49a49971361a",
      "Chapter 2":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/404.png?alt=media&token=4ecab361-4c2e-461e-b5b2-49a49971361a",
      "Chapter 3":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/404.png?alt=media&token=4ecab361-4c2e-461e-b5b2-49a49971361a",
      "Chapter 4":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/EEE%2FVLSI%2FVLSI%20Design_Unit-3%20%26%204.pdf?alt=media&token=e2c8dd14-a767-4709-a134-37635d8e83bc",
      "Chapter 5":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/404.png?alt=media&token=4ecab361-4c2e-461e-b5b2-49a49971361a",
    },
    LICA: {
      "Chapter 1":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/EEE%2FLICA%20COMPLETE%20NOTES.pdf?alt=media&token=814b8a61-c5dd-400c-a449-aa8a49a33ae0",
      "Chapter 3":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/404.png?alt=media&token=4ecab361-4c2e-461e-b5b2-49a49971361a",
      "Chapter 2":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/404.png?alt=media&token=4ecab361-4c2e-461e-b5b2-49a49971361a",
      "Chapter 4":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/404.png?alt=media&token=4ecab361-4c2e-461e-b5b2-49a49971361a",
      "Chapter 5":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/404.png?alt=media&token=4ecab361-4c2e-461e-b5b2-49a49971361a",
    },
    Oops: {
      "Chapter 1":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/404.png?alt=media&token=4ecab361-4c2e-461e-b5b2-49a49971361a",
      "Chapter 2":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/404.png?alt=media&token=4ecab361-4c2e-461e-b5b2-49a49971361a",
      "Chapter 3":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/404.png?alt=media&token=4ecab361-4c2e-461e-b5b2-49a49971361a",
      "Chapter 4":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/404.png?alt=media&token=4ecab361-4c2e-461e-b5b2-49a49971361a",
      "Chapter 5":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/404.png?alt=media&token=4ecab361-4c2e-461e-b5b2-49a49971361a",
    },
  },
  MEC: {},
  CIV: {},
  IT: {
    "Artificial Intelligence": {
      Notes:
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSE%2FAI-All%20Units.pdf?alt=media&token=c57ad992-412f-436e-8d66-35a7abc83cf5",
    },
    "Computer Networks": {
      "Chapter 1":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/404.png?alt=media&token=4ecab361-4c2e-461e-b5b2-49a49971361a",
      "Chapter 2":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/404.png?alt=media&token=4ecab361-4c2e-461e-b5b2-49a49971361a",
      "Chapter 3":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/404.png?alt=media&token=4ecab361-4c2e-461e-b5b2-49a49971361a",
      "Chapter 4":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/404.png?alt=media&token=4ecab361-4c2e-461e-b5b2-49a49971361a",
      "Chapter 5":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/404.png?alt=media&token=4ecab361-4c2e-461e-b5b2-49a49971361a",
    },
    DWM: {
      "Chapter 1":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSE%2FDWM%2FDWDM%20Unit%201.pdf?alt=media&token=fdec5cef-9e2c-414e-8744-366f5a8361d7",
      "Chapter 2":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSE%2FDWM%2FDWDM%20Unit%202.pdf?alt=media&token=3a990ec6-f705-44ec-90a4-a654cbebc3a0",
      "Chapter 3-1":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSE%2FDWM%2FDWDM%20Unit%203_Part-1.pdf?alt=media&token=efd24687-2713-4676-b5be-82bfe1335e0b",
      "Chapter 3-2":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSE%2FDWM%2FDWDM%20Unit%203_Part-2.pdf?alt=media&token=17c474a2-e84b-4b2e-ae93-913a7d1bdd8c",
      "Chapter 4":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSE%2FDWM%2FDWDM%20Unit%204.pdf?alt=media&token=e487369e-7f3d-407a-b152-2ae342ebb97f",
      "Chapter 5":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSE%2FDWM%2FDWDM%20Unit%205.pdf?alt=media&token=c48d0fca-8fb3-40cf-909f-ff80d6347b5b",
      textbook:
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSE%2FDWM%2FVipin%20Kumar_Text%20Book.pdf?alt=media&token=35e87e92-5351-4b64-aa8c-7e8d197e90b8",
    },
    FED: {
      "Chapter 1":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/404.png?alt=media&token=4ecab361-4c2e-461e-b5b2-49a49971361a",
      "Chapter 2":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/404.png?alt=media&token=4ecab361-4c2e-461e-b5b2-49a49971361a",
      "Chapter 3":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/404.png?alt=media&token=4ecab361-4c2e-461e-b5b2-49a49971361a",
      "Chapter 4":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/404.png?alt=media&token=4ecab361-4c2e-461e-b5b2-49a49971361a",
      "Chapter 5":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/404.png?alt=media&token=4ecab361-4c2e-461e-b5b2-49a49971361a",
    },
    FLAT: {
      Textbook:
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSE%2FShyamalendu%20Kandar%20-%20Introduction%20to%20Automata%20Theory%2C%20Formal%20Languages%20and%20Computation-Pearson%20Education%20India%20(2016).pdf?alt=media&token=bc2608ce-5508-4004-9e55-621294be2027",
    },
  },
  CSO: {
    DAA: {
      "Chapter 1":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSO%2FDAA%2FDAA-UNIT-1.pdf?alt=media&token=8f3c5f0c-fcc9-43c8-b229-0fcc6903895c",
      "Chapter 2":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSO%2FDAA%2FDAA-UNIT-2.pdf?alt=media&token=d517217b-9716-4ad9-9ca0-1c264845bdd1",
      "Chapter 3":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSO%2FDAA%2FDAA-UNIT-3.pdf?alt=media&token=f970bc14-76e6-4325-8cb1-4ee98fd568f1",
      "Chapter 4":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSO%2FDAA%2FDAA-UNIT-4.pdf?alt=media&token=8a1f3ac1-ab8b-4cbe-85a0-a7906f97746e",
      "Chapter 5":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSO%2FDAA%2FDAA-UNIT-5.pdf?alt=media&token=28d19346-7027-4552-b1b7-7d3c147a2fd0",
    },
    ML: {
      "Chapter 1":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSO%2FML%2FMachine%20Learning%20intro.pdf?alt=media&token=edb61190-4844-4025-a5c0-3f42f5e309a5",
      "Chapter 2":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSO%2FML%2FML%20UNIT-II.pdf?alt=media&token=7e1183f2-09c2-4457-b246-76e872c88b8d",
      "Chapter 3":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSO%2FML%2Funit%20-III.pdf?alt=media&token=cd418cb9-388b-47ac-92e1-49c2e1d79359",
      "Chapter 4":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSO%2FML%2FUNIT-IV.pdf?alt=media&token=68fdbc82-4d16-4cc6-8ec4-c9c08f5a1ffa",
      "Chapter 5":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSO%2FML%2FUNIT-V.pdf?alt=media&token=fab8e32f-aaa6-4061-a4cb-4a11772c8d6e",
    },
    MPMC: {
      "Chapter 1":
        "https://firebasestorage.goFMPMC%20UNIT-1.pdf?alt=media&token=f0e7c0f8-a0c8-4f9c3f3e3d7",
      "Chapter 2":
        "https://fireba79.appspot.com/o/CSO%2FMPMC%2FMPMC%20UNIT-2.pdf?alt=media&token=f0ee3d7",
      "Chapter 3":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSO%2FMPMC%2FMpmc%20unit%203.pdf?alt=media&token=7b7f58af-e0c2-4dbe-a6eb-5d5690ddbbdd",
      "Chapter 4":
        "https://MC%2FMPMC%20UNIT-4.pdf?alt=media&token=f0e7c0f8-a0c8-4f9c-b0d1-c1c3b3f3e3d7",
      "Chapter 5":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/404.png?alt=media&token=4ecab361-4c2e-461e-b5b2-49a49971361a",
    },
    "P&A": {
      "Chapter 1":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSO%2FP%26A%2FP%20and%20A%20for%20WSN-Unit-1.pdf?alt=media&token=3f8bddf0-c5be-4239-8be4-62b5f35b2f6e",
      "Chapter 2":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSO%2FP%26A%2FP%20and%20A%20for%20WSN-Unit-2.pdf?alt=media&token=6f0554a4-e448-4e63-aecb-f7ae33dc59fe",
      "Chapter 3-1":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSO%2FP%26A%2FP%20and%20A%20for%20WSN-Unit-3.1.pdf?alt=media&token=00fba0d4-7740-4c16-bd39-789ad6a57828",
      "Chapter 4":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSO%2FP%26A%2FP%26A%20UNIT-4.pdf?alt=media&token=f0e7c0f8-a0c8-4f9c-b0d1-c1c3b3f3e3d7",
      "Chapter 5":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSO%2FP%26A%2FP%26A%20UNIT-5.pdf?alt=media&token=f0e7c0f8-a0c8-4f9c-b0d1-c1c3b3f3e3d7",
    },
  },
  CSM: {
    IIP: {
      "Chapter 1-1":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSM%2FIPP%2FIPP%20Unit-1%20Part-I_Fundamentals%20of%20Image%20Processing.pdf?alt=media&token=3fdb584b-15c2-47e4-8258-7222558ffe5f",
      "Chapter 1-2":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSM%2FIPP%2FIPP%20Unit-1%20Part-II_Fundamentals%20of%20Color%20Image%20Processing.pdf?alt=media&token=d3d54280-d27a-4aae-be95-7098c7a8279f",
      "Chapter 2-1":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSM%2FIPP%2FIPP%20UNIT-II%20Part-I%20Image%20Enhancement%20in%20Spatial%20Domain.pdf?alt=media&token=63fdd863-c336-4703-b3f2-a3998356dc72",
      "Chapter 2-2":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSM%2FIPP%2FIPP%20UNIT-II%20Part-II%20Image%20Enhancement%20in%20Frequency%20Domain.pdf?alt=media&token=51c54da6-1eff-410a-b7a4-a1dd69daee3c",
      "Chapter 3":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSM%2FIPP%2FIPP%20UNIT-III%20Image%20Restoration%20and%20Reconstruction.pdf?alt=media&token=34a6f83c-4932-4fd7-9851-cc91d368d0ab",
      "Chapter 4-1":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSM%2FIPP%2FIPP%20UNIT-IV%20Part-I%20Image%20Segmentation.pdf?alt=media&token=748afb72-9c0a-4652-a0f5-d090ed47d160",
      "Chapter 4-2":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSM%2FIPP%2FIPP%20Unit-IV%20Part-II_Morphological%20Image%20Processing.pdf?alt=media&token=3b654107-46da-4bcb-aff7-4a074cbd5531",
      "Chapter 5":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSM%2FIPP%2FIPP%20UNIT-V%20Image%20Compression.pdf?alt=media&token=e84cef75-7dc3-41e0-9319-cf8bd21cfc11",
    },
    ML: {
      "Chapter 1":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSO%2FML%2FMachine%20Learning%20intro.pdf?alt=media&token=edb61190-4844-4025-a5c0-3f42f5e309a5",
      "Chapter 2":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSO%2FML%2FML%20UNIT-II.pdf?alt=media&token=7e1183f2-09c2-4457-b246-76e872c88b8d",
      "Chapter 3":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSO%2FML%2Funit%20-III.pdf?alt=media&token=cd418cb9-388b-47ac-92e1-49c2e1d79359",
      "Chapter 4":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSO%2FML%2FUNIT-IV.pdf?alt=media&token=68fdbc82-4d16-4cc6-8ec4-c9c08f5a1ffa",
      "Chapter 5":
        "https://firebasestorage.googleapis.com/v0/b/file-c6979.appspot.com/o/CSO%2FML%2FUNIT-V.pdf?alt=media&token=fab8e32f-aaa6-4061-a4cb-4a11772c8d6e",
    },
  },
  CIC: {},
  AI: {},
};

const Page = () => {
  const [selectedBranch, setSelectedBranch] = useState<Branch>("CSE");
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState<"notes" | "questionPapers">(
    "notes",
  );

  return (
    <div className="p-6">
      <Greeting />
      <Navbar />

      {/* Branch Selection */}
      {/* <div className="mb-6 mt-4 flex items-center gap-8 overflow-x-auto  lg:justify-center">
        {branches.map((branch) => (
          <button
            key={branch}
            onClick={() => {
              setSelectedBranch(branch);
              setSelectedSubject(null);
            }}
            className={`rounded-full px-8 py-2 ${
              selectedBranch === branch
                ? "bg-[#0f7b7c] text-white"
                : "bg-[#454545] text-[#f7eee3]"
            }`}
          >
            {branch}
          </button>
        ))}
      </div> */}

      {/* Selection between Notes and Question Papers */}
      {selectedSubject === null ? (
        <div className="flex flex-col gap-12 overflow-x-auto items-center justify-center mt-6">
          {Object.keys(subjects[selectedBranch] || {}).map((subject) => (
            <div
              key={subject}
              onClick={() => setSelectedSubject(subject)}
              className="relative flex  w-full cursor-pointer flex-col p-3 text-3xl text-[#f7eee3]  border-b-2 border-[#f7eee334] hover:text-orange-600 hover:text-4xl"
            >
              {/* <div className="absolute bottom-0 right-0 w-full rounded-b-xl bg-[#f7eee3] px-3 py-1 text-center text-lg font-medium text-[#0c0c0c]">
                {subject}
              </div> */}
              {subject}
            </div>
          ))}
        </div>
      ) : (
        <div>
          <div className="mt-16 flex items-center justify-between p-2">
            <button
              onClick={() => setSelectedSubject(null)}
              className="mb-4 flex rounded-full py-2 text-sm text-[#f7eee3] hover:text-[#0f7b7c] lg:text-lg"
            >
              <StepBack />
              
            </button>
            {/* Type Selection */}
            <div className="mb-4 flex gap-4">
              <button
                onClick={() => setSelectedType("notes")}
                className={`rounded-xl px-3 text-sm py-2 lg:px-4 ${selectedType === "notes" ? "bg-[#f7eee3] text-[#0c0c0c]" : "bg-[#454545] text-[#f7eee3]"}`}
              >
                Notes
              </button>
              <button
                onClick={() => setSelectedType("questionPapers")}
                className={`rounded-xl px-4 py-2 ${selectedType === "questionPapers" ? "bg-[#f7eee3] text-[#0c0c0c]" : "bg-[#454545] text-[#f7eee3]"}`}
              >
                Question Papers
              </button>
            </div>
          </div>

          {/* Content Display based on Type Selection */}
          {selectedType === "notes" ? (
            <div className="flex flex-wrap items-center justify-center  gap-6 overflow-x-auto lg:justify-start">
              {selectedSubject &&
                subjects[selectedBranch][selectedSubject] &&
                Object.entries(subjects[selectedBranch][selectedSubject]).map(
                  ([chapter, link]) => (
                    <Link key={chapter} href={link} target="_blank">
                      <div className="custom-inset relative h-[220px] w-[250px] cursor-pointer rounded-xl border-2 border-[#f7eee3] bg-[#FF5E00] backdrop-blur-lg">
                        <div className="text-md absolute bottom-0 right-0 w-full text-nowrap rounded-b-xl bg-[#f7eee3] px-3 py-1 font-medium text-[#0c0c0c]">
                        {chapter}
                        </div>
                        
                      </div>
                    </Link>
                  ),
                )}
            </div>
          ) : (
            <div className="flex flex-wrap gap-6 overflow-x-auto">
              {/* Example Question Papers; replace with actual data */}
              <Link
                href={`https://cloud.link/to/${selectedBranch}/${selectedSubject}/qp1`}
                target="_blank"
              >
                <div className="flex h-[100px] w-[200px] items-center justify-center rounded-lg bg-[#0f7b7c] p-2 text-center text-white ">
                  Question Paper 1
                </div>
              </Link>
              <Link
                href={`https://cloud.link/to/${selectedBranch}/${selectedSubject}/qp2`}
                target="_blank"
              >
                <div className="flex h-[100px] w-[200px] items-center justify-center rounded-lg bg-[#434080] p-2 text-center text-white">
                  Question Paper 2
                </div>
              </Link>
              {/* Add more question papers as needed */}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default Page;
