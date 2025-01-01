import { useUser } from "@/context/userContext";
import { client } from "@/lib/rpc";
import type { installLinkedin } from "@/trigger/installLinkedin.trigger";
import { Button } from "@conquest/ui/button";
import { Label } from "@conquest/ui/label";
import { RadioGroup, RadioGroupItem } from "@conquest/ui/radio-group";
import { Separator } from "@conquest/ui/separator";
import { useRealtimeTaskTrigger } from "@trigger.dev/react-hooks";
import { Info } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";

export const ListOrganizations = () => {
  const { linkedin } = useUser();
  const [loading, setLoading] = useState(linkedin?.status === "SYNCING");
  const [orgs, setOrgs] = useState({
    results: {
      "76558959": {
        vanityName: "no-code-genius",
        localizedName: "No-code Genius",
        website: {
          localized: {
            en_US: "https://nocodegenius.io",
          },
          preferredLocale: {
            country: "US",
            language: "en",
          },
        },
        groups: [],
        versionTag: "3786995493",
        coverPhotoV2: {
          cropped: "urn:li:digitalmediaAsset:C4D1BAQHVqovJhLahaw",
          original: "urn:li:digitalmediaAsset:C4D1BAQHVqovJhLahaw",
          cropInfo: {
            x: 0,
            width: 1584,
            y: 63,
            height: 268,
          },
        },
        defaultLocale: {
          country: "FR",
          language: "fr",
        },
        organizationType: "PARTNERSHIP",
        alternativeNames: [],
        specialties: [],
        localizedSpecialties: [],
        industries: ["urn:li:industry:132"],
        name: {
          localized: {
            fr_FR: "No-code Genius",
          },
          preferredLocale: {
            country: "FR",
            language: "fr",
          },
        },
        primaryOrganizationType: "NONE",
        locations: [],
        id: 76558959,
        localizedWebsite: "https://nocodegenius.io",
        logoV2: {
          cropped: "urn:li:digitalmediaAsset:C4D0BAQH686NClz9zRA",
          original: "urn:li:digitalmediaAsset:C4D0BAQH686NClz9zRA",
          cropInfo: {
            x: 0,
            width: 0,
            y: 0,
            height: 0,
          },
        },
      },
      "94255993": {
        vanityName: "supakit-app",
        localizedName: "Supakit",
        website: {
          localized: {
            fr_FR: "https://supakit.so/",
          },
          preferredLocale: {
            country: "FR",
            language: "fr",
          },
        },
        foundedOn: {
          year: 2023,
        },
        groups: [],
        description: {
          localized: {
            fr_FR:
              "Supakit est le nouveau standard de la maintenance, apportant modernité et simplicité à votre gestion. Intégrez toutes vos données de maintenance dans un seul outil performant. Planification des interventions, gestion des équipements et contrats, rapports d'analyse, accompagnement financier et comptable : tout est centralisé en un seul endroit. Grâce à la personnalisation et à l'automatisation, Supakit s'adapte parfaitement à vos processus de maintenance et à votre façon de travailler. C'est la solution tout-en-un pour vous et vos équipes. \n\nLa maintenance c'est coeur, alors choisissez le meilleur outil.\n\nDécouvrez Supakit, le nouveau standard de la maintenance : \nhttps://www.supakit.so/\n\n",
          },
          preferredLocale: {
            country: "FR",
            language: "fr",
          },
        },
        versionTag: "3692601721",
        defaultLocale: {
          country: "FR",
          language: "fr",
        },
        organizationType: "PRIVATELY_HELD",
        alternativeNames: [],
        specialties: [
          {
            locale: {
              country: "FR",
              language: "fr",
            },
            tags: ["maintenance", "GMAO"],
          },
        ],
        localizedSpecialties: ["maintenance", "GMAO"],
        industries: ["urn:li:industry:4"],
        name: {
          localized: {
            fr_FR: "Supakit",
          },
          preferredLocale: {
            country: "FR",
            language: "fr",
          },
        },
        primaryOrganizationType: "NONE",
        locations: [],
        id: 94255993,
        localizedDescription:
          "Supakit est le nouveau standard de la maintenance, apportant modernité et simplicité à votre gestion. Intégrez toutes vos données de maintenance dans un seul outil performant. Planification des interventions, gestion des équipements et contrats, rapports d'analyse, accompagnement financier et comptable : tout est centralisé en un seul endroit. Grâce à la personnalisation et à l'automatisation, Supakit s'adapte parfaitement à vos processus de maintenance et à votre façon de travailler. C'est la solution tout-en-un pour vous et vos équipes. \n\nLa maintenance c'est coeur, alors choisissez le meilleur outil.\n\nDécouvrez Supakit, le nouveau standard de la maintenance : \nhttps://www.supakit.so/\n\n",
        localizedWebsite: "https://supakit.so/",
        logoV2: {
          cropped: "urn:li:digitalmediaAsset:D4E0BAQGfnhX36N7oXA",
          original: "urn:li:digitalmediaAsset:D4E0BAQGfnhX36N7oXA",
          cropInfo: {
            x: 0,
            width: 0,
            y: 0,
            height: 0,
          },
        },
      },
      "104941091": {
        vanityName: "useconquest",
        localizedName: "Conquest",
        website: {
          localized: {
            fr_FR: "https://useconquest.com/",
          },
          preferredLocale: {
            country: "FR",
            language: "fr",
          },
        },
        groups: [],
        description: {
          localized: {
            fr_FR:
              "Conquest is a community data platform to help you grow your community and your business. \n\nMap members activities across channels, identify champions, and gain actionable insights to fuel community growth.",
          },
          preferredLocale: {
            country: "FR",
            language: "fr",
          },
        },
        versionTag: "2394780312",
        defaultLocale: {
          country: "FR",
          language: "fr",
        },
        organizationType: "PARTNERSHIP",
        alternativeNames: [],
        specialties: [],
        localizedSpecialties: [],
        industries: ["urn:li:industry:4"],
        name: {
          localized: {
            fr_FR: "Conquest",
          },
          preferredLocale: {
            country: "FR",
            language: "fr",
          },
        },
        primaryOrganizationType: "NONE",
        locations: [],
        id: 104941091,
        localizedDescription:
          "Conquest is a community data platform to help you grow your community and your business. \n\nMap members activities across channels, identify champions, and gain actionable insights to fuel community growth.",
        localizedWebsite: "https://useconquest.com/",
        logoV2: {
          cropped: "urn:li:digitalmediaAsset:D4E0BAQHij-aBjBQWsg",
          original: "urn:li:digitalmediaAsset:D4E0BAQHij-aBjBQWsg",
          cropInfo: {
            x: 0,
            width: 0,
            y: 0,
            height: 0,
          },
        },
      },
      "105844665": {
        vanityName: "conquest-sandbox",
        localizedName: "conquest-sandbox",
        groups: [],
        versionTag: "280501279",
        organizationType: "PARTNERSHIP",
        defaultLocale: {
          country: "FR",
          language: "fr",
        },
        alternativeNames: [],
        specialties: [],
        localizedSpecialties: [],
        industries: ["urn:li:industry:4"],
        name: {
          localized: {
            fr_FR: "conquest-sandbox",
          },
          preferredLocale: {
            country: "FR",
            language: "fr",
          },
        },
        primaryOrganizationType: "NONE",
        locations: [],
        id: 105844665,
      },
    },
    statuses: {
      "76558959": 200,
      "94255993": 200,
      "104941091": 200,
      "105844665": 200,
    },
    errors: {},
  });

  const [selectedOrg, setSelectedOrg] = useState({
    organization_id: "",
    organization_name: "",
  });
  const router = useRouter();

  const onClick = async () => {
    const response = await client.api.linkedin.organizations.$get();
    const data = await response.json();
  };

  const { submit, run } = useRealtimeTaskTrigger<typeof installLinkedin>(
    "install-linkedin",
    {
      accessToken: linkedin?.trigger_token,
    },
  );

  const onStart = async () => {
    if (!linkedin) return;
    setLoading(true);
    submit({
      linkedin,
      organization_id: selectedOrg.organization_id,
      organization_name: selectedOrg.organization_name,
    });
  };

  useEffect(() => {
    if (!run?.status) return;

    const isCompleted = run.status === "COMPLETED";
    const isFailed = run.status === "FAILED";

    if (isFailed) {
      setLoading(false);
      toast.error("Failed to install Slack", { duration: 5000 });
    }

    if (isCompleted) {
      setLoading(false);
      setSelectedOrg({
        organization_id: "",
        organization_name: "",
      });
      router.refresh();
    }
  }, [run]);

  return (
    <>
      <Separator className="my-4" />
      {!selectedOrg && <Button onClick={onClick}>List Organizations</Button>}
      <p className="font-medium text-base">Organizations</p>
      <RadioGroup
        className="mt-3"
        onValueChange={(value) =>
          setSelectedOrg({
            organization_id: value,
            organization_name: "conquest-sandbox",
          })
        }
      >
        {Object.entries(orgs.results).map(([id, org]) => (
          <div key={id} className="flex items-center space-x-2">
            <RadioGroupItem value={id} id={id} />
            <Label htmlFor={id}>{org.localizedName}</Label>
          </div>
        ))}
      </RadioGroup>
      {loading && (
        <div className="actions-secondary mt-6 rounded-md border p-4">
          <Info size={18} className="text-muted-foreground" />
          <p className="mt-2 mb-1 font-medium">Collecting data</p>
          <p className="text-muted-foreground">
            This may take a few minutes.
            <br />
            You can leave this page while we collect your data.
            <br />
            Do not hesitate to refresh the page to see data changes.
          </p>
        </div>
      )}
      <Button
        className="mt-6"
        onClick={onStart}
        loading={loading}
        disabled={!selectedOrg}
      >
        Let's start!
      </Button>
    </>
  );
};
