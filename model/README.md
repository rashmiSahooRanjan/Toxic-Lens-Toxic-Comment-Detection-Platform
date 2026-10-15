Place the supplied model artifacts here. This package already contains:
- toxic_comment_model.h5
- tokenizer.pkl
- config.json
- metadata.json

The metadata reports Keras 3.13.2. The ML service handles H5 artifacts saved by this version when running the older Keras version required by Python 3.10 by removing only null `quantization_config` entries before reconstructing the model and loading its weights. Non-null quantization metadata or other H5 incompatibilities require a model artifact saved with a compatible Keras version.
