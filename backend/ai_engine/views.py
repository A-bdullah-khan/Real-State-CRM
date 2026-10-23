from rest_framework import serializers, status
from rest_framework.response import Response
from rest_framework.views import APIView

from .services import AIAgentService, AIEngineNotConfigured

# Tool calls whose inputs/results are returned to the client by AIChatView.
PUBLIC_TOOL_RESULTS = {"search_properties"}


class ChatRequestSerializer(serializers.Serializer):
    message = serializers.CharField(max_length=4000)
    history = serializers.ListField(child=serializers.DictField(), required=False, default=list)


class AIStatusView(APIView):
    """GET /api/ai/status/ — lets the frontend decide whether to enable the chat UI."""

    def get(self, request):
        service = AIAgentService()
        return Response(
            {
                "configured": service.is_configured,
                "provider": service.provider,
                "model": service.model,
                "tools": service.available_tools,
            }
        )


class AIChatView(APIView):
    """
    POST /api/ai/chat/ — run one turn of the CRM assistant.

    Body: {"message": str, "history": [{"role", "content"}, ...]}. The client owns the
    conversation history; the server is stateless between turns.
    """

    def post(self, request):
        payload = ChatRequestSerializer(data=request.data)
        payload.is_valid(raise_exception=True)
        service = AIAgentService()
        try:
            result = service.run_agent(payload.validated_data["message"], payload.validated_data["history"])
        except AIEngineNotConfigured as exc:
            # Also catches AIProviderError (subclass): bad key, rate limit, provider outage.
            return Response({"detail": str(exc)}, status=status.HTTP_503_SERVICE_UNAVAILABLE)
        # Only listing searches are exposed so the client can render property cards; lead and
        # follow-up tool results stay server-side.
        tool_calls = [call for call in result["tool_calls"] if call["name"] in PUBLIC_TOOL_RESULTS]
        return Response({"reply": result["reply"], "tool_calls": tool_calls})
