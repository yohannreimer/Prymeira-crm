import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const Welcome = () => (
  <Card>
    <CardHeader className="px-4">
      <CardTitle>Prymeira Vincula</CardTitle>
    </CardHeader>
    <CardContent className="px-4">
      <p className="text-sm mb-4">
        Organize leads, contatos, empresas e negócios em um só lugar.
      </p>
      <p className="text-sm mb-4">
        Acompanhe próximas ações, pipeline comercial, propostas e atividades da
        equipe sem sair do fluxo comercial.
      </p>
    </CardContent>
  </Card>
);
