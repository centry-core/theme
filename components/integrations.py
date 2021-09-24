# from flask import render_template
# from pylon.core.tools import log  # pylint: disable=E0611,E0401
#
#
# def integrations_list(context, slot, payload):
#     if not context.slot_manager.callbacks.get("integrations"):
#         log.warning("No integrations were registered")
#         return render_template(
#             "configuration/integrations/all.html",
#             config=payload
#         )
#
#     payload['integrations'] = "security_scanners"
#
#     return render_template(
#         f"configuration/integrations/all.html",
#         config=payload
#     )